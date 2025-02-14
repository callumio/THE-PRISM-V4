import { getPollResults, resultsCanvas } from "#helpers/polls";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
export class PrismClientUtil {
    constructor(client) {
        this.client = client;
    }
    /**
     * Mention a DatabaseMember.
     * @param {DatabaseMember} member DatabaseMember to mention
     * @param {Guild} guild Guild the member is apart of.
     * @returns {string} If the member exists, a tag. If the member does not exist, the user tag. If the user does not exist, `Deleted User`.
     */
    async mentionDatabaseMember(member, guild) {
        return new Promise(async (resolve) => {
            try {
                resolve(`<@${(await guild.members.fetch(member.user_id)).id}>`);
            }
            catch {
                try {
                    resolve((await this.client.users.fetch(member.user_id)).tag);
                }
                catch {
                    resolve('`Deleted User`');
                }
                ;
            }
            ;
        });
    }
    ;
    /**
     * Get the User for a DatabaseMember
     * @param {DatabaseMember} member DatabaseMember to to get the user for.
     * @returns {Promise<User | undefined>}
     */
    async getDatabaseMemberUser(member) {
        return new Promise(async (resolve) => {
            try {
                resolve((await this.client.users.fetch(member.user_id)));
            }
            catch {
                resolve(undefined);
            }
            ;
        });
    }
    ;
    /**
     * Get GuildMember from User
     * @param {User} user User
     * @param {Guild} guild Guild
     * @returns {Promise<GuildMember | undefined>} Returns GuildMember, if no member exists, returns undefined.
     */
    async getMemberFromUser(user, guild) {
        return new Promise(async (resolve) => {
            try {
                resolve(await guild.members.fetch(user));
            }
            catch {
                resolve(undefined);
            }
        });
    }
    async fetchMessageFromURL(url) {
        try {
            let arr = url.match(/\d[\d\/]+/)[0].split('/');
            return await (await this.client.channels.fetch(arr[1]))?.messages.fetch(arr[2]);
        }
        catch {
            return undefined;
        }
    }
    async trackPoll(poll) {
        this.client.logger.debug(`Tracking poll ${poll.poll_id}`);
        const message = await this.client.util.fetchMessageFromURL(poll.message_url);
        const timer = poll.end_timestamp - Date.now();
        if (!message)
            return;
        if (timer > 2147483647) {
            setTimeout(async () => {
                this.trackPoll(await this.client.db.fetchPoll(message));
            }, 2147483647);
        }
        else {
            setTimeout(async () => {
                const { optionValues, results, totalVotes } = await getPollResults(this.client.db, message);
                message.edit({
                    files: totalVotes > 0 ? [
                        new AttachmentBuilder(resultsCanvas(optionValues, results), { name: 'data.png' })
                    ] : [],
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Poll')
                            .setDescription(message.embeds[0].description.split("\n").map((s, i) => `${s} \`${results[i]} votes\``).join("\n"))
                            .setImage('attachment://data.png')
                    ],
                    components: []
                });
            }, timer);
        }
    }
}
//# sourceMappingURL=PrismClientUtil.js.map