import {
	EditorView,
	Decoration,
	DecorationSet,
	ViewPlugin,
	ViewUpdate,
	PluginValue,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

import PraecordiPlugin from "main";

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

				builder.add(
					from,
					to,
					Decoration.mark({
						attributes: { class: "p-lang", "data-lang": lang },
					})
				);
			}
		}

		if (defaultLang) {
			while ((match = shorthandRegex.exec(docText)) !== null) {
				const from = match.index;
				const to = from + match[0].length;

				if (!isRangeSelected(this.view, from, to)) {
					builder.add(
						from,
						to,
						Decoration.mark({
							attributes: {
								class: "p-lang",
								"data-lang": defaultLang,
							},
						})
					);
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
