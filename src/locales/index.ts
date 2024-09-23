import i18n from '@/i18n';
import zh from '@/locales/zh';

type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
        ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
        : `${Key}`
}[keyof ObjectType & (string | number)];

export type TranslationKeys = NestedKeyOf<typeof zh>;

export function translate(key: TranslationKeys | string): string {
    return i18n.global.t(key);
}
