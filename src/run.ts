import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from './handler'
import {Label} from './interfaces/label'
import {Configuration} from './interfaces/configuration'

export async function run(): Promise<void> {
  try {
    const configuration = getConfiguration()
    const octokit = github.getOctokit(configuration.githubToken)

    const handlers = [
      handler.handleApprovals(octokit, github.context),
      handler.handle(octokit, github.context, configuration)
    ]

    await Promise.all(handlers)
  } catch (error) {
    core.setFailed(error.message)
  }
}

function getConfiguration(): Configuration {
  const githubToken = core.getInput('github-token')
  const inReviewLabel: Label = JSON.parse(core.getInput('in-review-label'))
  const doneLabel: Label = JSON.parse(core.getInput('done-label'))

  return {
    githubToken,
    inReviewLabel,
    doneLabel
  }
}
