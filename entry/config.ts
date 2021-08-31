export enum ConfigScope {
    ALL,
    OWNED,
    UNOWNED,
}

interface Descriptor {
    defaultValue: any;
    scope: ConfigScope;
    description: string;
}

class DescriptorBase<T> implements Descriptor {
    readonly defaultValue: T;
    readonly scope: ConfigScope;
    readonly title: string;
    readonly description: string;

    constructor(defaultValue: T, scope: ConfigScope, title: string, description = '') {
        this.defaultValue = defaultValue;
        this.scope = scope;
        this.title = title;
        this.description = description;
    }
}

export class Percentage extends DescriptorBase<number> { }
export class NumberOption extends DescriptorBase<number> { }
export class StringOption extends DescriptorBase<string> { }
export class BoolOption extends DescriptorBase<boolean> { }

export class MultipleChoice extends DescriptorBase<string> {
    choices: Array<[string, string]>;

    constructor(defaultValue: string, scope: ConfigScope, title: string, choices: Array<[string, string]>, description = '') {
        super(defaultValue, scope, title, description);
        this.choices = choices;
    }
}

export interface ConfigurationOptions {
    [key: string]: Descriptor;
}

export type ConfigType<T extends ConfigurationOptions> = {
    [P in keyof T]: T[P]["defaultValue"];
} & {enabled: boolean};

export function defaultValues<T extends ConfigurationOptions>(options: T): ConfigType<T> {
    return {enabled: false, ...Object.fromEntries(Object.entries(options).map(([key, value]) => [key, value.defaultValue]))} as ConfigType<T>;
}
