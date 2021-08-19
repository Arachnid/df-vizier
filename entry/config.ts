interface Descriptor {
    defaultValue: any;
}

export class Percentage implements Descriptor {
    defaultValue: number;

    constructor(defaultValue: number) {
        this.defaultValue = defaultValue;
    }
}

export class RelativeLevel implements Descriptor {
    defaultValue: number;

    constructor(defaultValue: number) {
        this.defaultValue = defaultValue;
    }
}

export class NumberOption implements Descriptor {
    defaultValue: number;

    constructor(defaultValue: number) {
        this.defaultValue = defaultValue;
    }
}

export class String implements Descriptor {
    defaultValue: string;

    constructor(defaultValue: string) {
        this.defaultValue = defaultValue;
    }
}

export class BoolOption implements Descriptor {
    defaultValue: boolean;

    constructor(defaultValue: boolean) {
        this.defaultValue = defaultValue;
    }
}

export interface ConfigurationOptions {
    [key: string]: Descriptor;
}

export const globalConfig = {
    energySendAmount: new Percentage(0.7),
    minEnergyReserve: new Percentage(0.15),
    dryRun: new BoolOption(false),
    runInterval: new NumberOption(60000),
    minCaptureLevel: new RelativeLevel(1),
    minActionLevel: new RelativeLevel(2),
};

export type GlobalConfig = {
    [P in keyof typeof globalConfig]: (typeof globalConfig)[P]["defaultValue"];
}

export type ConfigType<T extends ConfigurationOptions> = {
    [P in keyof T]: T[P]["defaultValue"];
} & { global: GlobalConfig };

export function defaultValues<T extends ConfigurationOptions>(options: T, global: GlobalConfig): ConfigType<T> {
    return Object.assign(Object.fromEntries(Object.entries(options).map(([key, value]) => [key, value.defaultValue])), { global }) as ConfigType<T>;
}
