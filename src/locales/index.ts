import i18n from '@/i18n';
import zh from '@/locales/zh';

type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
        ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
        : `${Key}`
}[keyof ObjectType & (string | number)];

type TranslationKeys = NestedKeyOf<typeof zh>;

export function translate<K extends TranslationKeys>(key: K | string): string {
    return i18n.global.t(key.toLowerCase());
}
