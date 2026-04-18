import { REST, Routes, SlashCommandBuilder } from "discord.js";

export const commandDefinitions = [
  new SlashCommandBuilder()
    .setName("tldr")
    .setDescription("Podsumuj film z YouTube")
    .addStringOption((option) => option.setName("url").setDescription("YouTube URL").setRequired(true))
    .addStringOption((option) =>
      option
        .setName("detail")
        .setDescription("Poziom szczegolowosci")
        .setRequired(true)
        .addChoices(
          { name: "niski", value: "low" },
          { name: "sredni", value: "mid" },
          { name: "wysoki", value: "high" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("start")
        .setDescription("Poczatek fragmentu (ss, mm:ss, hh:mm:ss)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("end")
        .setDescription("Koniec fragmentu (ss, mm:ss, hh:mm:ss)")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("fc")
    .setDescription("Zweryfikuj teze")
    .addStringOption((option) => option.setName("claim").setDescription("Tresc tezy").setRequired(true))
].map((command) => command.toJSON());

export async function syncSlashCommands({ token, clientId, guildId, logger }) {
  const rest = new REST({ version: "10" }).setToken(token);
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandDefinitions });
    logger.info({ guildId }, "guild slash commands synced");
    return;
  }

  await rest.put(Routes.applicationCommands(clientId), { body: commandDefinitions });
  logger.info("global slash commands synced");
}
