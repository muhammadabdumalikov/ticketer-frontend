<script lang="ts">
	type Headline = 'ticket' | 'secure' | 'fair';
	interface Props { headline?: Headline; }
	let { headline = 'ticket' }: Props = $props();
</script>

<aside class="brand">
	<div class="row">
		<div class="logo" aria-hidden="true"></div>
		<div class="wordmark">ticketer<span>.</span></div>
	</div>

	<h1>
		{#if headline === 'secure'}
			Безопасные билеты для <em>университетских экзаменов.</em>
		{:else if headline === 'fair'}
			Честно, под контролем, <em>и очень просто.</em>
		{:else}
			Управляйте билетами экзаменов <em>без бумажной волокиты.</em>
		{/if}
	</h1>
	<p class="sub">
		Рабочее пространство для билетов университетских преподавателей.
		Создавайте банки вопросов, планируйте сессии, проводите экзамены и оценивайте — всё в одном месте.
	</p>

	<div class="spec">
		<div class="label">Сегодня в Ticketer</div>
		<div class="item">
			<div class="num">01</div>
			<div class="it"><b>Теория вероятностей — Весенний экзамен</b><br/><span>Открытие в 14:00 · 27 вопросов · 90 мин</span></div>
		</div>
		<div class="item">
			<div class="num">02</div>
			<div class="it"><b>Дискретная математика — Пересдача</b><br/><span>4 студента · с прокторингом</span></div>
		</div>
		<div class="item">
			<div class="num">03</div>
			<div class="it"><b>Математический анализ II — Проверка банка</b><br/><span>12 новых вопросов на проверке</span></div>
		</div>
	</div>

	<div class="meta">
		<div>
			<div class="k">Преподавателей</div>
			<div class="v">2 840</div>
		</div>
		<div>
			<div class="k">Сессий / мес</div>
			<div class="v">18,6<small>тыс.</small></div>
		</div>
		<div>
			<div class="k">Университетов</div>
			<div class="v">112</div>
		</div>
	</div>
</aside>
