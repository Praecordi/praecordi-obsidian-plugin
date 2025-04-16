import {
	Plugin,
	App,
	Editor,
	MarkdownView,
	MarkdownPostProcessorContext,
	MarkdownFileInfo,
	Notice,
	PluginSettingTab,
	Setting,
} from "obsidian";

import { LangDecorationViewPlugin } from "lang-plugin";
import { computeCursorOffset } from "utils";

interface PraecordiPluginSettings {
	enableTokenReplace: boolean;
	defaultLanguage: string;
}

const DEFAULT_SETTINGS: PraecordiPluginSettings = {
	enableTokenReplace: true,
	defaultLanguage: "zn",
};

export default class PraecordiPlugin extends Plugin {
	settings: PraecordiPluginSettings;

	lookup: Record<string, string> = {
		":o;": "ø",
		":a;": "ɛ",
		":oe;": "œ",
		":OE;": "ɶ",
		":t;": "ʈ",
		":d;": "ɖ",
		":th;": "θ",
		":dh;": "ð",
		":sh;": "ʃ",
		":zh;": "ʒ",
		":.s;": "ʂ",
		":.z;": "ʐ",
		":v;": "ʋ",
		":r;": "ɹ",
	};

	private isReplacing: boolean = false;

	async onload() {
		console.log("PraecordiPlugin loaded");
		await this.loadSettings();

		this.addCommand({
			id: "toggle-token-replacement",
			name: "Toggle Token Replacement",
			callback: () => {
				this.settings.enableTokenReplace =
					!this.settings.enableTokenReplace;
				this.saveSettings();
				new Notice(
					`Token replacement ${
						this.settings.enableTokenReplace
							? "enabled"
							: "disabled"
					}`
				);
			},
		});

		this.app.workspace.on(
			"editor-change",
			(editor: Editor, _info: MarkdownView | MarkdownFileInfo) => {
				if (!this.settings.enableTokenReplace) return;
				if (this.isReplacing) return;

				const doc = editor.getDoc();
				const cursor = doc.getCursor();
				const line = doc.getLine(cursor.line);
				let newLine = line;
				let modified = false;

				for (const token in this.lookup) {
					if (newLine.includes(token)) {
						newLine = newLine.split(token).join(this.lookup[token]);
						modified = true;
					}
				}

				if (modified) {
					this.isReplacing = true;

					const offset = computeCursorOffset(
						line,
						cursor.ch,
						this.lookup
					);
					doc.replaceRange(
						newLine,
						{ line: cursor.line, ch: 0 },
						{ line: cursor.line, ch: line.length }
					);
					doc.setCursor({ line: cursor.line, ch: offset });
					this.isReplacing = false;
				}
			}
		);

		this.registerEditorExtension(LangDecorationViewPlugin(this));

		this.registerMarkdownPostProcessor(
			(element: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
				const explicitLangRegex = /{{([a-z]{2,}):(.+?)}}/g;
				const shorthandRegex = /{{([^:{}]+?)}}/g;
				const defaultLang = this.settings.defaultLanguage;

				element.innerHTML = element.innerHTML.replace(
					explicitLangRegex,
					(_, lang, content) => {
						return `<span class="p-lang" data-lang="${lang}">${content}</span>`;
					}
				);

				if (defaultLang) {
					element.innerHTML = element.innerHTML.replace(
						shorthandRegex,
						(_, content) => {
							return `<span class="p-lang" data-lang="${defaultLang}">${content}</span>`;
						}
					);
				}
			}
		);

		this.addSettingTab(new PraecordiPluginSettingTab(this.app, this));
	}

	onunload() {
		console.log("PraecordiPlugin unloaded");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

export class PraecordiPluginSettingTab extends PluginSettingTab {
	plugin: PraecordiPlugin;

	constructor(app: App, plugin: PraecordiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "Praecordi Plugin Settings" });

		new Setting(containerEl)
			.setName("Enable Token Replacement")
			.setDesc("Toggle search and replace for special tokens.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableTokenReplace)
					.onChange(async (value) => {
						this.plugin.settings.enableTokenReplace = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Default Language")
			.setDesc(
				"If set, shorthand markup {{content}} will be treated as {{lang:content}} using this default language.\ne.g. zn, fr, de, etc; "
			)
			.addText((text) =>
				text.setPlaceholder("zn").onChange(async (value) => {
					this.plugin.settings.defaultLanguage = value.trim();
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}
}
