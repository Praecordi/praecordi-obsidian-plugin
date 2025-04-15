import {
	EditorView,
	Decoration,
	DecorationSet,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
	PluginValue,
	PluginSpec,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

import PraecordiPlugin from "main";

class LangWidget extends WidgetType {
	lang: string;
	content: string;
	originalText: string;

	constructor(lang: string, content: string, originalText: string) {
		super();
		this.lang = lang;
		this.content = content;
		this.originalText = originalText;
	}

	toDOM(_view: EditorView): HTMLElement {
		const span = document.createElement("span");
		span.className = "p-lang";
		span.dataset.lang = this.lang;
		span.textContent = this.content;
		return span;
	}

	ignoreEvent(): boolean {
		return false;
	}
}

function isRangeSelected(view: EditorView, from: number, to: number): boolean {
	for (const range of view.state.selection.ranges) {
		if (range.from < to && range.to > from) {
			return true;
		}
	}

	return false;
}

class LangViewPlugin implements PluginValue {
	plugin: PraecordiPlugin;
	view: EditorView;
	decorations: DecorationSet;

	constructor(view: EditorView, plugin: PraecordiPlugin) {
		this.view = view;
		this.plugin = plugin;
		this.decorations = this.buildDecorations();
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.selectionSet) {
			this.decorations = this.buildDecorations();
		}
	}

	destory() {}

	buildDecorations(): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		const docText = this.view.state.doc.toString();
		const defaultLang = this.plugin.settings.defaultLanguage;

		const explicitLangRegex = /{{([a-z]{2,}):(.+?)}}/g;
		const shorthandRegex = /{{([^:{}]+?)}}/g;
		let match: RegExpExecArray | null;
		while ((match = explicitLangRegex.exec(docText)) !== null) {
			const from = match.index;
			const to = from + match[0].length;
			if (!isRangeSelected(this.view, from, to)) {
				const lang = match[1];
				const content = match[2];
				builder.add(
					from,
					to,
					Decoration.replace({
						widget: new LangWidget(lang, content, match[0]),
						inclusive: false,
					})
				);
			}

			if (defaultLang) {
				while ((match = shorthandRegex.exec(docText)) !== null) {
					const from = match.index;
					const to = from + match[0].length;

					if (!isRangeSelected(this.view, from, to)) {
						const content = match[1];
						builder.add(
							from,
							to,
							Decoration.replace({
								widget: new LangWidget(
									defaultLang,
									content,
									match[0]
								),
								inclusive: false,
							})
						);
					}
				}
			}
		}

		return builder.finish();
	}
}

export const LangDecorationViewPlugin = (plugin: PraecordiPlugin) =>
	ViewPlugin.define((view: EditorView) => new LangViewPlugin(view, plugin), {
		decorations: (v) => v.decorations,
	});
