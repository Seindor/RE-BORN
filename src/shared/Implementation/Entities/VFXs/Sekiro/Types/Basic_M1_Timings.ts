const basiccd = 0.55;
const M1_4_CD = 1.5;

export const Sekiro_Basic_M1_Timings = {
    Equipped: {
        M1_1: {
            duration: 0.5,
            cooldown: basiccd,
            events: {
                ["mark"]: 0.333,
                ["swingsound"]: 0,
                ["swingreg"]: 0.333,
                ["swingend"]: 0.5,
                ["hitreg"]: 0.366,
                ["hitend"]: 0.416,
            },
        },
        M1_2: {
            duration: 0.5,
            cooldown: basiccd,
            events: {
                ["mark"]: 0.266,
                ["swingsound"]: 0,
                ["swingreg"]: 0.266,
                ["swingend"]: 0.45,
                ["hitreg"]: 0.333,
                ["hitend"]: 0.45,
            },
        },
        M1_3: {
            duration: 0.5,
            cooldown: basiccd,
            events: {
                ["mark"]: 0.216,
                ["swingsound"]: 0,
                ["swingreg"]: 0.216,
                ["swingend"]: 0.416,
                ["hitreg"]: 0.333,
                ["hitend"]: 0.416,
            },
        },
        M1_4: {
            duration: 0.5,
            cooldown: M1_4_CD,
            events: {
                ["mark"]: 0.25,
                ["swingsound"]: 0.283,
                ["swingreg"]: 0.283,
                ["swingend"]: 0.5,
                ["hitreg"]: 0.316,
                ["hitend"]: 0.4,
            },
        },
    },
    Unequipped: {
        M1_1: {
            duration: 0.5,
            cooldown: basiccd,
            events: {
                ["mark"]: 0.333,
                ["swingsound"]: 0,
                ["swingreg"]: 0.333,
                ["swingend"]: 0.5,
                ["hitreg"]: 0.366,
                ["hitend"]: 0.416,
            },
        },
        M1_2: {
            duration: 0.5,
            cooldown: basiccd,
            events: {
                ["mark"]: 0.266,
                ["swingsound"]: 0,
                ["swingreg"]: 0.266,
                ["swingend"]: 0.45,
                ["hitreg"]: 0.333,
                ["hitend"]: 0.45,
            },
        },
        M1_3: {
            duration: 0.5,
            cooldown: basiccd,
            events: {
                ["mark"]: 0.216,
                ["swingsound"]: 0,
                ["swingreg"]: 0.216,
                ["swingend"]: 0.416,
                ["hitreg"]: 0.333,
                ["hitend"]: 0.416,
            },
        },
        M1_4: {
            duration: 0.5,
            cooldown: M1_4_CD,
            events: {
                ["mark"]: 0.25,
                ["swingsound"]: 0.283,
                ["swingreg"]: 0.283,
                ["swingend"]: 0.5,
                ["hitreg"]: 0.316,
                ["hitend"]: 0.4,
            },
        },
    },
};
