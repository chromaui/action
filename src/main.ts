import path from 'path';
import { getInput, error, setFailed, setOutput, info } from '@actions/core';
import { GitHub, context } from "@actions/github";
import { runTest } from 'storybook-chromatic/bin/tester/index';
import { verifyOptions } from 'storybook-chromatic/bin/lib/verify-option';

const maybe = (a: string, b: any = undefined) => {
  if(!a) {
    return b;
  }

  try {
    return JSON.parse(a);
  } catch(e){
    return a;
  }
}

const getCommit = (event: typeof context) => {
  switch (event.eventName) {
    case 'pull_request': {
      return {
        // @ts-ignore
        owner: event.payload.repository.owner.login, 
        // @ts-ignore
        repo: event.payload.repository.name,
        // @ts-ignore
        branch: event.payload.pull_request.head.ref,
        // @ts-ignore
        ref: event.ref || event.payload.pull_request.head.ref,
        // @ts-ignore
        sha: event.payload.pull_request.head.sha,
      };
    }
    case 'push': {
      return {
        // @ts-ignore
        owner: event.payload.repository.owner.login, 
        // @ts-ignore
        repo: event.payload.repository.name,
        branch: event.payload.ref.replace('refs/heads/', ''),
        ref: event.payload.ref,
        sha: event.payload.after,
      };
    }
    default: {
      setFailed(event.eventName + ' event is not supported in this action');

      return null;
    };
  }
}

interface Output {
  url: string;
  code: number;
}
async function runChromatic(options): Promise<Output> {
  const { exitCode, exitUrl } = await runTest(await verifyOptions(options));  

  return {
    url: exitUrl,
    code: exitCode,
  };
}

const getApi = () => {
  try {
    const token = getInput('token');
    return new GitHub(token);
  } catch (e){
    setFailed(e.message);

    return null;
  }
}

const getList = () => {
  const appCode = getInput('appCode');

  if (appCode) {
    return {
      default: {
        appCode,
        buildScriptName: maybe(getInput('buildScriptName')),
        scriptName: maybe(getInput('scriptName')),
        exec: maybe(getInput('exec')),
        doNotStart: maybe(getInput('doNotStart')),
        storybookPort: maybe(getInput('storybookPort')),
        storybookUrl: maybe(getInput('storybookUrl')),
        storybookBuildDir: maybe(getInput('storybookBuildDir')),
        storybookHttps: maybe(getInput('storybookHttps')),
        storybookCert: maybe(getInput('storybookCert')),
        storybookKey: maybe(getInput('storybookKey')),
        storybookCa: maybe(getInput('storybookCa')),
        autoAcceptChanges: maybe(getInput('autoAcceptChanges')),
        exitZeroOnChanges: maybe(getInput('exitZeroOnChanges'), true),
        ignoreLastBuildOnBranch: maybe(getInput('ignoreLastBuildOnBranch')),
        fromCI: true,
        interactive: false,
      },
    };
  } else {
    const configLocation = getInput('config');

    const list = require(path.resolve(configLocation));

    console.log({ list, env: process.env });

    return list;
  }

}

async function run() {
  let deployment_id: number = NaN;
  const api = getApi();
  const commit = getCommit(context);
  
  if (!api || !commit){
    return;
  }

  const { branch, repo, owner, sha } = commit;

  try {
    const list = getList();

    process.env.CHROMATIC_SHA = sha;
    process.env.CHROMATIC_BRANCH = branch;

    const outputs: Record<string, Output> = await Object.entries(list).reduce(async (acc, [k, v]) => {
      const existing = await acc;

      const deployment = api.repos.createDeployment({
        repo,
        owner,
        ref: branch,
        environment: k === 'default' ? 'chromatic' : 'chromatic ' + k,
        required_contexts: [],
        auto_merge: false,
      }).then(deployment => {
        deployment_id = deployment.data.id;
  
        return api.repos.createDeploymentStatus({
          repo,
          owner,
          deployment_id,
          state: 'pending',
        });
      }).catch(e => {
        deployment_id = NaN;
        console.log('adding deployment to GitHub failed, You are likely on a forked repo and do not have write access.');
      });
  
      const chromatic = runChromatic(v);
  
      const [{ url, code }] = await Promise.all([
        chromatic,
        deployment,
      ]);
  
      if (typeof deployment_id === 'number' && !isNaN(deployment_id)) {
        try {
          await api.repos.createDeploymentStatus({
            repo,
            owner,
            deployment_id,
            state: 'success',
            environment_url: url
          });
        } catch (e){
          //
        }
      }

      return { ...existing, [k]: { code, url } }
    }, Promise.resolve({}));


    Object.entries(outputs).forEach(([key, { url, code }]) => {
      const pre = key === 'default' ? '' : key + '-';

      setOutput(pre + 'url', url);
      setOutput(pre + 'code', code.toString());
    });
  } catch (e) {
    e.message && error(e.message);
    e.stack && error(e.stack);
    e.description && error(e.description);

    if (typeof deployment_id === 'number' && !isNaN(deployment_id)) {
      try {
        await api.repos.createDeploymentStatus({
          repo,
          owner,
          deployment_id,
          state: 'failure',
        });
      } catch (e){
        //
      }
    }

    setFailed(e.message);
  }
}
run();
