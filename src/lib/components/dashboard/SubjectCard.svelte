<script lang="ts">
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
			{subj.status === 'live' ? '● В ЭФИРЕ' : subj.status === 'draft' ? 'ЧЕРНОВИК' : 'АКТИВЕН'}
		</div>
	</div>
	<div>
		<div class="name">{subj.name}</div>
		<div class="code">{subj.code}</div>
	</div>
	<div class="row">
		<div class="stat-mini"><div class="k">Билетов</div><div class="v">{subj.tickets}</div></div>
		<div class="stat-mini"><div class="k">Экзаменов</div><div class="v">{subj.exams}</div></div>
		<div class="stat-mini"><div class="k">Студентов</div><div class="v">{subj.students}</div></div>
	</div>
	<div>
		<div class="progress-row">
			<span>Прогресс семестра</span>
			<span>{Math.round(subj.progress * 100)}%</span>
		</div>
		<div class="bar"><i style="width: {subj.progress * 100}%; background: {subj.color}"></i></div>
	</div>
</div>
