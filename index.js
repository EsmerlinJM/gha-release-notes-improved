const core = require('@actions/core');
const { Octokit } = require("@octokit/rest");
const { Configuration, OpenAIApi } = require("openai");

const repository = core.getInput('repository', { required: true });
const githubToken = core.getInput('github_token', { required: true });
const openAIApiKey = core.getInput('openai_api_key', { required: true });
const openAIModel = core.getInput('openai_model', { required: true });
const excludes = core.getInput('excludes', { required: false }).trim().split(",");

const octokit = (() => {
    if (githubToken) {
      return new Octokit({ auth: githubToken,});
    } else {
      return new Octokit();
    }
  })();

const main = async () => {
    try {
        const [owner, repo] = repository.split("/");

        var releases  = await octokit.repos.listReleases({
            owner: owner,
            repo: repo,
        });
        releases = releases.data;

        if (excludes.includes('prerelease')) {
            releases = releases.filter(x => x.prerelease != true);
        }

        if (excludes.includes('draft')) {
            releases = releases.filter(x => x.draft != true);
        }

        if (releases.length) {
            const configuration = new Configuration({
                apiKey: openAIApiKey,
            });

            const openai = new OpenAIApi(configuration);
            
            const completion = await openai.createChatCompletion({
            model: openAIModel,
            messages: [
                {
                    role: 'system',
                    'content': 'Your task is to rewrite release notes in a more concise manner, '+
                        'no need to mention specific commits. '+
                        'Group things by features / bug fixes / etc as appropriate. '+
                        'Try to focus on the most important changes. '+
                        'Try to use correctly emojis on feature / bug fixes / etc' +
                        'Return it in markdown format.',
                },
                {
                    role: 'user', 
                    content: String(releases[0].body)
                }
            ],
            });

            const improvedReleaseMessage = completion.data.choices[0].message.content;
            const releaseId = String(releases[0].id);

            const updatedRelease = octokit.repos.updateRelease({
                owner: owner,
                repo: repo,
                release_id: releaseId,
                body: improvedReleaseMessage,
                draft: false
            });

            core.setOutput('release', releases[0].tag_name);
            core.setOutput('id', String(releases[0].id));
            core.setOutput('description', String(updatedRelease.description));

            console.log(updatedRelease);

        } else {
            core.setFailed("No valid releases");
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

main();