# Praecordi's Obsidian Plugin

This is a multi-purpose plugin to add some features to my worldbuilding vault.

## Features

### Language Markup

While my world's wiki is written in English, I will occasionally require writing words in my conlang. To differentiate between English words and conlang words (and in the future play around with word checking and etc.), I introduce a markup to distinguish between words of different language.

> This is a statement in English. Adding {{fr:ce balisage}} will add custom styling depending on the language.
> 
> Alternatively, we can add {{juste des parenthèses}} which will mark the words in the brackets with the default language set in settings.

The language currently can only be used for different styles that can be set using css. For the above french markup, we can use:

```css
.p-lang[data-lang="fr"] {
	color: red;
	border-color: red;
}
```

`.p-lang` has a border-bottom already on it to distinguish any other language. The plugin also comes with a simple style for my primary and current default conlang `zn`. 

### Token Replacement

My conlang also includes unicode IPA symbols which are a pain to write. Thus, I have implemented a token replacement system which replaces certain tokens to their set IPA symbol.

For example, `:o;` is automatically replaced with `ø` as it is written. The markup for the token replacement cannot be changed, but new token replacements can be added or existing ones edited in the settings. The default replacements are the ones that I use for my conlang.

## Future

- [ ] Spell check for language/conlangs.