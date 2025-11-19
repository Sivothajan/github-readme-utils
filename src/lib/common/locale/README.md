# Locales

For a list of supported locale codes, see the `docs` folder.

## Date Format

If the default date format for the locale displays correctly, omit the `date_format` parameter.
Supplying a date format is optional and overrides the default locale date format.

| Different year | Same year | Format string |
| -------------- | --------- | ------------- |
| 10/8/2016      | 10/8      | `j/n[/Y]`     |
| 8/10/2016      | 8/10      | `n/j[/Y]`     |
| 2016.8.10      | 8.10      | `[Y.]n.j`     |

## Right-to-Left Language Support

To enable right-to-left language support, add `"rtl": true` to the `translations.json` entry (see `"he"` for an example).

## Comma Separator

To change the comma separator when enumerating excluded days, set `"comma_separator": ", "` in `translations.json` with the desired separator as the value.

## Aliases

To add an alias for a locale, add the alias as a key in `translations.json` with the locale it should redirect to as the value. For example, if `zh` is an alias for `zh_Hans`, add `"zh": "zh_Hans"`.
