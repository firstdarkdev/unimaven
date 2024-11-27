## Unimaven

An experimental project that allows modders to add releases from CurseForge, GitHub, Modrinth and NightBloom into a gradle project as a dependency.

Simply put, a maven repository for mods.

### Why?

Just because. No specific reason.

***

### Self Hosting

Unimaven makes use of Docker and Docker compose. Make sure you have both installed before continuing.

To get started, first clone this repository:

```bash
git clone https://github.com/firstdarkdev/unimaven.git
cd unimaven
```

Next, open up the `docker-compose.yml` file, and replace the following:

```yaml
CURSE_API_TOKEN: INSERT_YOUR_VALID_TOKEN_HERE
```
with your own valid curseforge api key. If you don't have one, you can apply [here](https://support.curseforge.com/en/support/solutions/articles/9000208346-about-the-curseforge-api-and-how-to-apply-for-a-key)

Finally, unimaven uses port `8080` by default. You can change this to any port, in the docker compose file.

Example:
```yaml
ports:
  - "8085:8080"
```
This means that unimaven will now be available at 127.0.0.1:8085


To start unimaven, run the following command:

```bash
docker compose up -d --build
```

***

Written in GO. Licensed under GPL-3.0. Join our [Discord](https://discord.firstdark.dev)