export type SessionStatsState = {
    [actorId: string]: {
        Health: {
            Value: number;
            MaxValue: number;
        };
        Posture: {
            Value: number;
            MaxValue: number;
        };
    };
};
