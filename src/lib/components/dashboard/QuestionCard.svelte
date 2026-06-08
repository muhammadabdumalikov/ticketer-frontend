<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import { _ } from 'svelte-i18n';

	export type QuestionType = 'single' | 'multi' | 'text' | 'numeric' | 'verbal';

	export interface BuilderQuestion {
		id: string;
		text: string;
		type: QuestionType;
		points: number;
		time: number;
		difficulty: 'easy' | 'medium' | 'hard';
		correct: number;
		answers: string[];
		rubric: string;
	}

	interface Props {
		q: BuilderQuestion;
		index: number;
		onChange: (q: BuilderQuestion) => void;
		onRemove: () => void;
		onDuplicate: () => void;
		onMove: (i: number, dir: number) => void;
	}

	let { q, index, onChange, onRemove, onDuplicate, onMove }: Props = $props();

	function setQ(patch: Partial<BuilderQuestion>) {
		onChange({ ...q, ...patch });
	}

	function setAnswer(i: number, v: string) {
		const next = q.answers.slice();
		next[i] = v;
		setQ({ answers: next });
	}

	function removeAnswer(i: number) {
		if (q.answers.length <= 2) return;
		const next = q.answers.filter((_, j) => j !== i);
		let correct = q.correct;
		if (i < correct) correct -= 1;
		else if (i === correct) correct = 0;
		setQ({ answers: next, correct });
	}

	function addAnswer() {
		if (q.answers.length >= 6) return;
		setQ({ answers: [...q.answers, ''] });
	}

	let typeLabel = $derived(
		q.type === 'single' ? $_('question.type.single') :
		q.type === 'multi' ? $_('question.type.multi') :
		q.type === 'text' ? $_('question.type.text') :
		q.type === 'verbal' ? $_('question.type.verbal') :
		$_('question.type.numeric')
	);
	let isVerbal = $derived(q.type === 'verbal');

	let typeOpts = $derived([
		{ value: 'single', label: $_('question.type.single') },
		{ value: 'multi', label: $_('question.type.multi') },
		{ value: 'text', label: $_('question.type.text') },
		{ value: 'numeric', label: $_('question.type.numeric') },
		{ value: 'verbal', label: $_('question.type.verbal'), hint: $_('question.manualGradingHint') }
	]);
	let diffOpts = $derived([
		{ value: 'easy', label: $_('question.difficulty.easy') },
		{ value: 'medium', label: $_('question.difficulty.medium') },
		{ value: 'hard', label: $_('question.difficulty.hard') }
	]);
</script>

<div class="q-card">
	<div class="q-head">
		<span class="q-num">{$_('question.numPrefix')} · {String(index + 1).padStart(2, '0')}</span>
		<span class="q-type-pill"><Icon name="list" /> {typeLabel}</span>
		{#if isVerbal}
			<span class="q-type-pill" style="background: #EEF0FF; color: #3346D1;">
				<Icon name="mic" /> {$_('question.manualGrading')}
			</span>
		{/if}
		<span class="q-type-pill" style="background: var(--accent-soft); color: var(--accent);">
			<Icon name="bolt" /> {$_('question.pointsBadge', { values: { n: q.points } })} · {isVerbal ? $_('question.timeBadgeMin', { values: { n: Math.round(q.time / 60) } }) : $_('question.timeBadgeSec', { values: { n: q.time } })}
		</span>
		<div class="spacer"></div>
		<span class="iconbtn" title={$_('question.moveUp')} onclick={() => onMove(index, -1)} onkeydown={(e) => e.key === 'Enter' && onMove(index, -1)} role="button" tabindex="0"><Icon name="up" /></span>
		<span class="iconbtn" title={$_('question.moveDown')} onclick={() => onMove(index, 1)} onkeydown={(e) => e.key === 'Enter' && onMove(index, 1)} role="button" tabindex="0"><Icon name="down" /></span>
		<span class="iconbtn" title={$_('question.duplicate')} onclick={onDuplicate} onkeydown={(e) => e.key === 'Enter' && onDuplicate()} role="button" tabindex="0"><Icon name="copy" /></span>
		<span class="iconbtn danger" title={$_('common.delete')} onclick={onRemove} onkeydown={(e) => e.key === 'Enter' && onRemove()} role="button" tabindex="0"><Icon name="trash" /></span>
	</div>

	<textarea
		class="q-text"
		placeholder={isVerbal
			? $_('question.placeholderVerbal', { values: { n: index + 1 } })
			: $_('question.placeholderDefault', { values: { n: index + 1 } })}
		value={q.text}
		oninput={(e) => setQ({ text: e.currentTarget.value })}
	></textarea>

	{#if isVerbal}
		<div class="verbal-block">
			<div class="m-field">
				<label for="rubric-{q.id}">{$_('question.rubricLabel')} <span class="m-hint">{$_('question.rubricHint')}</span></label>
				<textarea
					id="rubric-{q.id}"
					rows={4}
					value={q.rubric || ''}
					oninput={(e) => setQ({ rubric: e.currentTarget.value })}
					placeholder={$_('question.rubricPlaceholder')}
				></textarea>
			</div>
		</div>
	{:else}
		<div class="answers">
			{#each q.answers as a, i (i)}
				<div class="answer {q.correct === i ? 'correct' : ''}">
					<div
						class="radio"
						onclick={() => setQ({ correct: i })}
						onkeydown={(e) => e.key === 'Enter' && setQ({ correct: i })}
						title={$_('question.markCorrect')}
						role="radio"
						aria-checked={q.correct === i}
						tabindex="0"
					></div>
					<input
						class="atext"
						placeholder={$_('question.answerOption', { values: { letter: String.fromCharCode(1040 + i) } })}
						value={a}
						oninput={(e) => setAnswer(i, e.currentTarget.value)}
					/>
					<div
						class="remove"
						onclick={() => removeAnswer(i)}
						onkeydown={(e) => e.key === 'Enter' && removeAnswer(i)}
						title={$_('common.delete')}
						role="button"
						tabindex="0"
					><Icon name="trash" /></div>
				</div>
			{/each}
			<button type="button" class="add-answer" onclick={addAnswer}>
				<Icon name="plus" /> {$_('question.addAnswer')}
			</button>
		</div>
	{/if}

	<div class="q-foot">
		<div class="meta-field">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>{isVerbal ? $_('question.maxPoints') : $_('question.pointsForCorrect')}</label>
			<div class="val">
				<Icon name="star" />
				<input type="number" min="0" max="100" value={q.points} oninput={(e) => setQ({ points: parseInt(e.currentTarget.value || '0', 10) })} />
				<span style="color: var(--muted); font-size: 13px;">{$_('question.pointsUnit')}</span>
			</div>
		</div>
		<div class="meta-field">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>{isVerbal ? $_('question.answerLimit') : $_('question.answerTime')}</label>
			<div class="val">
				<Icon name="clock" />
				{#if isVerbal}
					<input type="number" min="1" max="30" value={Math.max(1, Math.round(q.time / 60))} oninput={(e) => setQ({ time: parseInt(e.currentTarget.value || '1', 10) * 60 })} />
					<span style="color: var(--muted); font-size: 13px;">{$_('units.min')}</span>
				{:else}
					<input type="number" min="10" max="900" step="10" value={q.time} oninput={(e) => setQ({ time: parseInt(e.currentTarget.value || '0', 10) })} />
					<span style="color: var(--muted); font-size: 13px;">{$_('units.sec')}</span>
				{/if}
			</div>
		</div>
		<div class="meta-field">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>{$_('question.difficultyLabel')}</label>
			<div class="val">
				<Icon name="bolt" />
				<Dropdown value={q.difficulty} onChange={(v) => setQ({ difficulty: v as BuilderQuestion['difficulty'] })} variant="inline" options={diffOpts} />
			</div>
		</div>
		<div class="meta-field">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>{$_('question.typeLabel')}</label>
			<div class="val">
				<Icon name="list" />
				<Dropdown value={q.type} onChange={(v) => setQ({ type: v as QuestionType })} variant="inline" options={typeOpts} />
			</div>
		</div>
	</div>
</div>
