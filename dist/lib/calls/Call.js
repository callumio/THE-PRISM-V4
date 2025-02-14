import { isChannelPublic } from "#helpers/discord";
import { blankFieldInline } from "#helpers/embeds";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from "discord.js";
export class Call {
    channel_id;
    user;
    constructor(data, client) {
        this.client = client;
        this.id = data.call_id;
        this.userId = data.user_id;
        this.persistent = Boolean(data.persistent);
        this.deleted = false;
        this.channel_id = data.channel_id;
        this.getChannel();
    }
    get guild() {
        return this.channel.guild;
    }
    get isPublic() {
        return isChannelPublic(this.channel);
    }
    get userLimit() {
        return this.channel.userLimit;
    }
    /**
     * Fetch voice channel
     * @returns {VoiceChannel | null} The channel, if there is one.
     */
    getChannel() {
        if (this.channel)
            return this.channel;
        try {
            const channel = this.client.channels.cache.get(this.channel_id);
            if (!channel) {
                this.end();
                throw 'No channel found';
            }
            if (channel.type !== ChannelType.GuildVoice) {
                this.end();
                throw "channel is wrong type";
            }
            return this.channel = channel;
        }
        catch (err) {
            this.end();
        }
    }
    /**
     * Fetch the call owner
     * @returns {User} Discord user
     */
    async fetchUser() {
        if (this.user)
            return this.user;
        return this.user = await this.client.users.fetch(this.userId);
    }
    /**
     * Send the options message on initialisation.
     * @returns {Message} The send message
     */
    async sendOptionsMessage() {
        const channel = this.getChannel();
        const msg = await channel?.send({
            embeds: [await this.getOptionsEmbed()],
            components: this.getOptionsComponents()
        });
        return msg;
    }
    /**
     * Ends a call, deleting the channel and the database entry
     * @returns {void} call#deleted
     */
    async end() {
        this.channel?.delete();
        this.client.db.deleteCall(this.id);
        this.deleted = true;
    }
    /**
     * Toggles the visibility of the voice channel for @everyone
     * @returns {boolean} New permission value
     */
    async toggleVisibility() {
        const priv = !this.isPublic;
        await this.channel.permissionOverwrites.edit(this.guild.roles.everyone.id, { ViewChannel: priv });
        return priv;
    }
    /**
     * Update call voice channel user limit
     * @param {number} n The new user limit
     * @returns The channel
     */
    async setUserLimit(n) {
        if (n < 0 || n > 99)
            throw 'User limit out of range';
        return await this.channel.setUserLimit(n);
    }
    /**
     * Get the Options Embed
     * @returns {EmbedBuilder} Embed
     */
    async getOptionsEmbed() {
        return new EmbedBuilder()
            .setTitle('Call Options')
            .setDescription('Configure your call here.')
            .addFields([
            { name: 'Created By', value: `${await this.fetchUser()}`, inline: true },
            blankFieldInline,
            { name: 'Visibility', value: this.isPublic ? '🔓 Public' : '🔒 Private', inline: true },
            { name: 'User Limit', value: `\`${this.userLimit > 0 ? this.userLimit : '0 (unlimited)'}\``, inline: true }
        ]);
    }
    getOptionsComponents() {
        return [
            new ActionRowBuilder()
                .addComponents([
                new ButtonBuilder()
                    .setCustomId('callEnd')
                    .setLabel('End')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('callToggleVisibility')
                    .setLabel('Toggle Visibility')
                    .setStyle(ButtonStyle.Secondary)
            ]),
            new ActionRowBuilder()
                .addComponents([
                new ButtonBuilder()
                    .setCustomId('callIncUserLimit')
                    .setLabel('(1) user limit')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('➕')
                    .setDisabled(this.userLimit == 99 ? true : false),
                new ButtonBuilder()
                    .setCustomId('callDecUserLimit')
                    .setLabel('(1) user limit')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('➖')
                    .setDisabled(this.userLimit == 0 ? true : false)
            ])
        ];
    }
}
//# sourceMappingURL=Call.js.map