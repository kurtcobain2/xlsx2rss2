import * as core from '@actions/core';
import * as github from '@actions/github';


type ISSUE_STATE = "open" | "closed" | undefined;
type ISSUE_REASON = "completed" | "not_planned" | "reopened" | null | undefined;

function run() {
    try {
        const TOKEN = core.getInput('github-token');
        const octokit = github.getOctokit(TOKEN);
        const ISSUE_NUM = core.getInput('issue-number');
        const COMMENT = core.getInput('comment');
        const STATE = <ISSUE_STATE>core.getInput('state');
        const STATE_REASON = <ISSUE_REASON>core.getInput('state-reason') || "completed";

        octokit.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: parseInt(ISSUE_NUM),
            body: COMMENT
        }).then((res) => {
            if (!!STATE) {
                octokit.rest.issues.update({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                    issue_number: parseInt(ISSUE_NUM),
                    state: STATE,
                    state_reason: STATE_REASON
                }).then((res) => {
                    console.log('success');
                }).catch((err) => {
                    core.setFailed(err);
                })
            }
        }).catch((err) => {
            core.setFailed(err);
        })
    } catch (error:any) {
        core.setFailed(error.message);
    }
}
run();