import createPreset from 'conventional-changelog-conventionalcommits';
import { CommitParser } from 'conventional-commits-parser';

const preset = {
	name: 'conventionalcommits',
	types: [
		{ type: 'feat', section: 'Features' },
		{ type: 'fix', section: 'Bug fixes' },
		{ type: 'perf', section: 'Performance improvements' },
		{ type: 'refactor', section: 'Refactoring' },
		{ type: 'test', section: 'Tests' },
		{ type: 'docs', section: 'Documentation' },
		{ type: 'chore', section: 'Chores' },
		{ type: 'release', hidden: true },
		{ type: 'revert', hidden: true },
		{ type: 'build', hidden: true },
		{ type: 'ci', section: 'CI improvements' },
		{ type: 'wip', hidden: true },
		{ type: 'nvm', hidden: true },
	],
};

const { parser, whatBump, writer } = createPreset(preset);
const commitParser = new CommitParser(parser);

function resolveSquashCommit(commit) {
	if (commit.type || !/ \(#\d+\)$/u.test(commit.header) || !commit.body?.startsWith('* ')) return commit;

	// GitHub can put the original commit messages in the body of a squash commit.
	// Use the strongest change for the release and keep the PR title as its changelog entry.
	let strongest;
	let strongestLevel = Infinity;
	const notes = [...commit.notes];
	const messages = [commit.body, commit.footer].filter(Boolean).join('\n');
	for (const [, header] of messages.matchAll(/^\* (\S[^\n]*)$/gmu)) {
		const entry = commitParser.parse(header);
		notes.push(...entry.notes);
		const bump = whatBump([entry]);
		if (bump && bump.level < strongestLevel) {
			strongest = entry;
			strongestLevel = bump.level;
		}
	}

	if (!strongest) return commit;
	return {
		...commit,
		type: strongest.type,
		subject: commit.header,
		notes,
	};
}

export default {
	plugins: {
		'@release-it/conventional-changelog': {
			preset,
			whatBump: (commits) => whatBump(commits.map((commit) => resolveSquashCommit(commit))),
			writerOpts: {
				transform: (commit, context) => writer.transform(resolveSquashCommit(commit), context),
				headerPartial: (context) => (context.version ? writer.headerPartial(context) : ''),
			},
		},
	},
};
