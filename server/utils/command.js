// const os = require("os");

// function buildCommand(cmd, args) {
//   const platform = os.platform();

//   // Create the command string (e.g., 'npx --yes --package @axe-core/cli axe --stdout https://...')
//   const commandString = args.length > 0 ? `${cmd} ${args.join(" ")}` : cmd;

//   if (platform === "win32") {
//     // ✅ FIX: Pass the entire command string directly to WSL's default shell/interpreter.
//     // We run the command within a shell environment by setting shell: true in the spawn options.
//     return {
//       command: "wsl",
//       args: ["/bin/sh", "-c", commandString],
//     };
//   } else {
//     // Mac/Linux, run directly.
//     return {
//       command: cmd,
//       args,
//     };
//   }
// }

// module.exports = { buildCommand };
