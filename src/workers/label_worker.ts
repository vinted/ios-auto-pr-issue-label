import {PullRequest} from '../github/pull_request'
import {Issue} from '../github/issue'
import {Configuration} from '../interfaces/configuration'
import {Worker} from './worker'
import {Labeler} from './labeler'

export class LabelWorker implements Worker {
  private pr: PullRequest
  private issue: Issue
  private labeler: Labeler
  private linkedIssueToPRNumber: number
  private configuration: Configuration

  constructor(
    pr: PullRequest,
    issue: Issue,
    linkedIssueToPRNumber: number,
    configuration: Configuration
  ) {
    this.pr = pr
    this.issue = issue
    this.linkedIssueToPRNumber = linkedIssueToPRNumber
    this.configuration = configuration
    this.labeler = new Labeler(this.issue, this.linkedIssueToPRNumber)
  }

  async run(): Promise<void> {
    const {inReviewLabel, doneLabel} = this.configuration

    await this.createLabelsInRepoIfNeeded()

    if (this.pr.isMerged()) {
      await this.labeler.removeLabelIfNeeded(inReviewLabel.name)
      await this.labeler.addLabelIfNeeded(doneLabel.name)
    } else {
      await this.labeler.addLabelIfNeeded(inReviewLabel.name)
    }
  }

  private async createLabelsInRepoIfNeeded(): Promise<void> {
    const {inReviewLabel, doneLabel} = this.configuration
    const listLabelsInRepo = await this.issue.listLabelsInRepo()

    if (!listLabelsInRepo.find(name => name == inReviewLabel.name)) {
      await this.issue.createLabel(inReviewLabel)
    }
    if (!listLabelsInRepo.find(name => name == doneLabel.name)) {
      await this.issue.createLabel(doneLabel)
    }
  }
}
