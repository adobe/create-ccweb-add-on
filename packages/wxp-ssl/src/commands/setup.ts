import { Command, Flags } from "@oclif/core";

export default class Setup extends Command {
    static args = {};
    static description = "Say hello";
    static examples = [
        `<%= config.bin %> <%= command.id %> friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`
    ];
    static flags = {
        from: Flags.string({ char: "f", description: "Who is saying hello", required: true })
    };

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Setup);

        this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`);
    }
}
