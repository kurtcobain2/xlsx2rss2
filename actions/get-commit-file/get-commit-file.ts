import * as core from '@actions/core';
import * as github from '@actions/github';
import path from 'path';


async function run() {
    try {
        const TOKEN = core.getInput('github-token');
        const octokit = github.getOctokit(TOKEN);
        const FILENAME = core.getInput('file-name') || "";

        octokit.rest.repos.getCommit({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            ref: github.context.sha
        }).then((res) => {
            if (res.data.files) {
                core.setOutput(
                    'files', 
                    res.data.files
                        .map((v) => {
                            if (FILENAME.length > 0) {
                                let filenameReg = new RegExp(`^${FILENAME.replace(/\*/g, '.+')}$`);
    
                                if (!filenameReg.test(v.filename))
                                    return undefined;
                            }
    
                            return {
                                name: v.filename,
                                base_name: path.basename(v.filename),
                                origin_name: path.parse(path.basename(v.filename)).name,
                                status: v.status,
                                url: {
                                    blob: v.blob_url,
                                    raw: v.raw_url
                                }
                            }
                        })
                        .filter((v) => !!v)
                );
            } else {
                throw new Error(`No File`);
            }
        }).catch((err) => {
            console.log(err);
            core.setFailed(err);
        })
    } catch (error:any) {
        console.log(error)
        core.setFailed(error);
    }
}
run();