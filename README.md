# gh-release-messages-improved
A Github action will be running on workflows to create improved release message or changelog powered by AI.

## Configuration

### Inputs

Name | Description | Example | Required
--- | --- | ---
repository | The Github owner/repository | `EsmerlinJM/gh-release-messages-improved` | true
openai_api_key | OpenAI API Token | `bMeHCJV1wV8A2JXM....` | true
github_token | Github auth token (default variable for each action session) | `${{ secrets.GITHUB_TOKEN }}` | true
excludes | Exclude types of release explited by comma (prerelease | stable | latest | nodraft) | prerelease, draft, etc... | false

#### Possible values for `type` input
* *stable* - Get the stable `latest` release
* *prerelease* - Get the latest `prerelease`
* *latest* - Get the *really* latest release with no matter is it stable or prerelease
* *nodraft* - Get the *really* latest release excluding drafts

### Outputs
Action outputs 3 variables
- `release` - Latest release name
- `id` - Latest release ID
- `description` - Latest release description body

## Usage example

```
name: Improve release message/changelog

on:
  release:
    types: [ created ]

jobs:

  improve-release:
    runs-on: ubuntu-latest
    name: Improve release message
    steps:
      - name: Update release
        uses: EsmerlinJM/gha-release-messages-improved@main
        with:
          repository: EsmerlinJM/gha-release-messages-improved
          openai_api_key: ${{ secrets.OPENAI_TOKEN }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```
