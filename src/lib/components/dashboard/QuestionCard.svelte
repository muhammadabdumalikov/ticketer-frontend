<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';

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
		q.type === 'single' ? 'Один вариант' :
		q.type === 'multi' ? 'Несколько вариантов' :
		q.type === 'text' ? 'Текстовый ответ' :
		q.type === 'verbal' ? 'Устный ответ' :
		'Числовой ответ'
	);
	let isVerbal = $derived(q.type === 'verbal');

	const typeOpts = [
		{ value: 'single', label: 'Один вариант' },
		{ value: 'multi', label: 'Несколько вариантов' },
		{ value: 'text', label: 'Текстовый ответ' },
		{ value: 'numeric', label: 'Числовой ответ' },
		{ value: 'verbal', label: 'Устный ответ', hint: 'Оценка вручную преподавателем' }
	];
	const diffOpts = [
		{ value: 'easy', label: 'Лёгкая' },
		{ value: 'medium', label: 'Средняя' },
		{ value: 'hard', label: 'Сложная' }
	];
</script>

<div class="q-card">
	<div class="q-head">
		<span class="q-num">В · {String(index + 1).padStart(2, '0')}</span>
		<span class="q-type-pill"><Icon name="list" /> {typeLabel}</span>
		{#if isVerbal}
			<span class="q-type-pill" style="background: #EEF0FF; color: #3346D1;">
				<Icon name="mic" /> Оценка вручную
			</span>
		{/if}
		<span class="q-type-pill" style="background: var(--accent-soft); color: var(--accent);">
			<Icon name="bolt" /> до {q.points} баллов · {isVerbal ? `до ${Math.round(q.time / 60)} мин` : `${q.time}с`}
		</span>
		<div class="spacer"></div>
		<span class="iconbtn" title="Вверх" onclick={() => onMove(index, -1)} onkeydown={(e) => e.key === 'Enter' && onMove(index, -1)} role="button" tabindex="0"><Icon name="up" /></span>
		<span class="iconbtn" title="Вниз" onclick={() => onMove(index, 1)} onkeydown={(e) => e.key === 'Enter' && onMove(index, 1)} role="button" tabindex="0"><Icon name="down" /></span>
		<span class="iconbtn" title="Дублировать" onclick={onDuplicate} onkeydown={(e) => e.key === 'Enter' && onDuplicate()} role="button" tabindex="0"><Icon name="copy" /></span>
		<span class="iconbtn danger" title="Удалить" onclick={onRemove} onkeydown={(e) => e.key === 'Enter' && onRemove()} role="button" tabindex="0"><Icon name="trash" /></span>
	</div>

	<textarea
		class="q-text"
		placeholder={isVerbal
			? `Введите вопрос №${index + 1} для устного ответа…\n\nнапр. «Расскажите о свойствах нормального распределения и его применении на практике»`
			: `Введите вопрос №${index + 1}…\n\nнапр. «В компании 100 сотрудников: 60 занимаются программированием…»`}
		value={q.text}
		oninput={(e) => setQ({ text: e.currentTarget.value })}
	></textarea>

	{#if isVerbal}
		<div class="verbal-block">
			<div class="m-field">
				<label for="rubric-{q.id}">Ключевые моменты / критерии оценки <span class="m-hint">(видно только преподавателю)</span></label>
				<textarea
					id="rubric-{q.id}"
					rows={4}
					value={q.rubric || ''}
					oninput={(e) => setQ({ rubric: e.currentTarget.value })}
					placeholder="Перечислите тезисы, которые студент должен раскрыть, или рубрику оценки…Что считается полным ответом, что — частичным"
				></textarea>
			</div>
		</div>

		<div class="verbal-preview">
			<div class="verbal-preview-head">
				<div class="label-mono">Как это выглядит во время экзамена</div>
				<span class="q-type-pill" style="background: #fff; color: var(--muted);">превью</span>
			</div>
			<div class="verbal-preview-body">
				<div class="vp-timer">
					<div class="vp-timer-display">00:00</div>
					<div class="vp-timer-meta">лимит до {Math.round(q.time / 60)} мин</div>
				</div>
				<button type="button" class="vp-start" tabindex={-1}>
					<span class="vp-rec"></span> Старт — студент начал отвечать
				</button>
				<div class="vp-rating">
					<div class="vp-rating-label">
						<span>Баллы</span>
						<span class="vp-rating-val"><b>3</b> / {q.points}</span>
					</div>
					<div class="vp-stars">
						{#each Array.from({ length: Math.min(q.points, 10) }, (_, i) => i) as i (i)}
							{@const filled = i < 3}
							<span class="vp-star {filled ? 'on' : ''}" aria-hidden="true">
								<svg width="26" height="26" viewBox="0 0 24 24"
									fill={filled ? 'currentColor' : 'none'}
									stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
									<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
								</svg>
							</span>
						{/each}
						{#if q.points > 10}
							<span class="vp-stars-more">· из {q.points}</span>
						{/if}
					</div>
				</div>
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
						title="Отметить как правильный"
						role="radio"
						aria-checked={q.correct === i}
						tabindex="0"
					></div>
					<input
						class="atext"
						placeholder={`Вариант ${String.fromCharCode(1040 + i)}`}
						value={a}
						oninput={(e) => setAnswer(i, e.currentTarget.value)}
					/>
					<div
						class="remove"
						onclick={() => removeAnswer(i)}
						onkeydown={(e) => e.key === 'Enter' && removeAnswer(i)}
						title="Удалить"
						role="button"
						tabindex="0"
					><Icon name="trash" /></div>
				</div>
			{/each}
			<button type="button" class="add-answer" onclick={addAnswer}>
				<Icon name="plus" /> Добавить вариант ответа
			</button>
		</div>
	{/if}

	<div class="q-foot">
		<div class="meta-field">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>{isVerbal ? 'Максимум баллов' : 'Баллы за правильный ответ'}</label>
			<div class="val">
				<Icon name="star" />
				<input type="number" min="0" max="100" value={q.points} oninput={(e) => setQ({ points: parseInt(e.currentTarget.value || '0', 10) })} />
				<span style="color: var(--muted); font-size: 13px;">баллов</span>
			</div>
		</div>
		<div class="meta-field">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>{isVerbal ? 'Лимит на ответ' : 'Время на ответ'}</label>
			<div class="val">
				<Icon name="clock" />
				{#if isVerbal}
					<input type="number" min="1" max="30" value={Math.max(1, Math.round(q.time / 60))} oninput={(e) => setQ({ time: parseInt(e.currentTarget.value || '1', 10) * 60 })} />
					<span style="color: var(--muted); font-size: 13px;">мин</span>
				{:else}
					<input type="number" min="10" max="900" step="10" value={q.time} oninput={(e) => setQ({ time: parseInt(e.currentTarget.value || '0', 10) })} />
					<span style="color: var(--muted); font-size: 13px;">сек</span>
				{/if}
			</div>
		</div>
		<div class="meta-field">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>Сложность</label>
			<div class="val">
				<Icon name="bolt" />
				<Dropdown value={q.difficulty} onChange={(v) => setQ({ difficulty: v as BuilderQuestion['difficulty'] })} variant="inline" options={diffOpts} />
			</div>
		</div>
		<div class="meta-field">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>Тип вопроса</label>
			<div class="val">
				<Icon name="list" />
				<Dropdown value={q.type} onChange={(v) => setQ({ type: v as QuestionType })} variant="inline" options={typeOpts} />
			</div>
		</div>
	</div>
</div>
