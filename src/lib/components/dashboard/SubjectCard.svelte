<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { Subject } from '$lib/api/subjects';

	interface Props {
		subj: Subject;
		onOpen: (s: Subject) => void;
	}
	let { subj, onOpen }: Props = $props();
</script>

<div class="subj" onclick={() => onOpen(subj)} onkeydown={(e) => e.key === 'Enter' && onOpen(subj)} role="button" tabindex="0">
	<div class="top">
		<div class="sigil" style="background: {subj.color}14; color: {subj.color}">{subj.sigil}</div>
		<div class="pill-status {subj.status === 'live' ? 'live' : ''}">
			{subj.status === 'live' ? $_('subjectCard.statusLive') : subj.status === 'draft' ? $_('subjectCard.statusDraft') : $_('subjectCard.statusActive')}
		</div>
	</div>
	<div>
		<div class="name">{subj.name}</div>
		<div class="code">{subj.code}</div>
	</div>
	<div class="row">
		<div class="stat-mini"><div class="k">{$_('subjectCard.colTickets')}</div><div class="v">{subj.tickets}</div></div>
		<div class="stat-mini"><div class="k">{$_('subjectCard.colExams')}</div><div class="v">{subj.exams}</div></div>
		<div class="stat-mini"><div class="k">{$_('subjectCard.colStudents')}</div><div class="v">{subj.students}</div></div>
	</div>
	<div>
		<div class="progress-row">
			<span>{$_('subjectCard.progressSemester')}</span>
			<span>{Math.round(subj.progress * 100)}%</span>
		</div>
		<div class="bar"><i style="width: {subj.progress * 100}%; background: {subj.color}"></i></div>
	</div>
</div>
