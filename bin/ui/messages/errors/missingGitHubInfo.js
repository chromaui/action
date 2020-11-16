import chalk from 'chalk';
import dedent from 'ts-dedent';

import { error, info } from '../../components/icons';
import link from '../../components/link';

export default ({ GITHUB_WORKFLOW }) =>
  dedent(chalk`
    ${error} {bold Missing GitHub environment variable}
    \`GITHUB_WORKFLOW\` environment variable set to '${GITHUB_WORKFLOW}', but
    \`GITHUB_SHA\` and \`GITHUB_REF\` are not both set.
    ${info} Read more at ${link('https://www.chromatic.com/docs/ci#github-actions')}
  `);
