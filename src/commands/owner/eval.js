const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const config = require('../../config/permissions');
const { inspect } = require('util');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Execute JavaScript code 🔧')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('JavaScript code to execute')
        .setRequired(true)),
  
  permission: config.levels.OWNER,
  cooldown: 0,
  defer: true,
  ephemeral: true,
  
  async execute(interaction, client) {
    const code = interaction.options.getString('code');
    
    try {
      // Create a safe context
      const context = {
        client,
        interaction,
        guild: interaction.guild,
        channel: interaction.channel,
        user: interaction.user,
        member: interaction.member,
        require,
        console,
        process: {
          version: process.version,
          uptime: process.uptime,
          memoryUsage: process.memoryUsage
        }
      };
      
      // Execute code in context
      const result = await eval(`(async () => {
        const { ${Object.keys(context).join(', ')} } = arguments[0];
        return ${code};
      })`)(context);
      
      // Format result
      let output = inspect(result, { depth: 1, maxArrayLength: 10 });
      
      // Truncate if too long
      if (output.length > 1900) {
        output = output.substring(0, 1900) + '...';
      }
      
      const embed = EmbedUtils.success(
        `\`\`\`js\n${output}\`\`\``,
        '🔧 Eval Result'
      ).addFields(
        { name: 'Input', value: `\`\`\`js\n${code.substring(0, 1000)}\`\`\``, inline: false },
        { name: 'Type', value: `\`${typeof result}\``, inline: true },
        { name: 'Execution Time', value: `\`${Date.now() - interaction.createdTimestamp}ms\``, inline: true }
      );
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      const embed = EmbedUtils.error(
        `\`\`\`js\n${error.message}\`\`\``,
        '❌ Eval Error'
      ).addFields(
        { name: 'Input', value: `\`\`\`js\n${code.substring(0, 1000)}\`\`\``, inline: false }
      );
      
      await interaction.editReply({ embeds: [embed] });
    }
  }
};