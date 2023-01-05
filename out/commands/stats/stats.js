import { __decorate } from "tslib";
import { groupDigits } from "#helpers/numbers";
import { PrismCommand } from "#structs/PrismCommand";
import { ApplyOptions } from "@sapphire/decorators";
import { MessageEmbed } from "discord.js";
let StatCommand = class StatCommand extends PrismCommand {
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('stats')
            .setDescription('Get stats.')
            .addUserOption((option) => option //
            .setName('user')
            .setDescription('User\'s stats to query')
            .setRequired(false)), {
            // [dev, prod]
            idHints: ['870331312836341800']
        });
    }
    async chatInputRun(interaction) {
        if (!interaction.guild)
            return;
        await interaction.deferReply();
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user ? user.id : interaction.user.id);
        const { total_messages, total_voice_minutes, total_muted_minutes } = await this.db.fetchMember(member);
        return await interaction.editReply({ embeds: [
                new MessageEmbed()
                    .setThumbnail(member.displayAvatarURL({ size: 128 }))
                    .setFields([
                    {
                        name: 'MESSAGES',
                        value: `\`${groupDigits(total_messages)}\``,
                        inline: true
                    },
                    // blankFieldInline,
                    {
                        name: 'VOICE',
                        value: `\`${groupDigits(total_voice_minutes)} minutes\``,
                        inline: true
                    },
                    // blankFieldInline,
                    {
                        name: 'MUTED',
                        value: `\`${groupDigits(total_muted_minutes)} minutes\``,
                        inline: true
                    }
                ])
            ]
        });
    }
};
StatCommand = __decorate([
    ApplyOptions({})
], StatCommand);
export { StatCommand };
//# sourceMappingURL=stats.js.map