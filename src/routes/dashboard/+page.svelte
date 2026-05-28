<script lang="ts">
	import '$lib/styles/dashboard.css';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/dashboard/Sidebar.svelte';
	import Topbar, { type Crumb } from '$lib/components/dashboard/Topbar.svelte';
	import HomeView from '$lib/components/dashboard/HomeView.svelte';
	import SubjectsListView from '$lib/components/dashboard/SubjectsListView.svelte';
	import SubjectView from '$lib/components/dashboard/SubjectView.svelte';
	import TicketsView from '$lib/components/dashboard/TicketsView.svelte';
	import BuilderView from '$lib/components/dashboard/BuilderView.svelte';
	import AddSubjectModal from '$lib/components/dashboard/AddSubjectModal.svelte';
	import { subjectsApi, type Subject } from '$lib/api/subjects';
	import { examsApi, type ApiExamListItem } from '$lib/api/exams';
	import { sessionsApi, type ApiUpcomingSession } from '$lib/api/sessions';

	type View = 'home' | 'subjects' | 'subject' | 'builder' | 'tickets';

	let view = $state<View>('home');
	let activeSubject = $state<Subject | null>(null);
	let builderStart = $state(0);
	let builderReturn = $state<View>('home');
	let showAddSubject = $state(false);
	let editingExamId = $state<string | null>(null);

	let subjects = $state<Subject[]>([]);
	let exams = $state<ApiExamListItem[]>([]);
	let upcomingSessions = $state<ApiUpcomingSession[]>([]);
	let loading = $state(true);
	let loadError = $state('');

	async function refresh() {
		try {
			[subjects, exams, upcomingSessions] = await Promise.all([
				subjectsApi.list(),
				examsApi.list(),
				sessionsApi.listUpcoming()
			]);
			loadError = '';
		} catch (err) {
			loadError = (err as Error).message;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		document.body.classList.add('page-dashboard');
		void refresh();
		return () => document.body.classList.remove('page-dashboard');
	});

	function handleSubjectAdded(s: Subject) {
		subjects = [...subjects, s];
	}

	function navigate(id: string) {
		if (id === 'home') view = 'home';
		else if (id === 'subjects') view = 'subjects';
		else if (id === 'tickets') view = 'tickets';
		else view = 'home';
	}

	function openSubject(s: Subject) {
		activeSubject = s;
		view = 'subject';
	}

	function createExam(subject: Subject | null) {
		builderReturn = view;
		editingExamId = null;
		if (subject) {
			activeSubject = subject;
			builderStart = 1;
		} else {
			activeSubject = null;
			builderStart = 0;
		}
		view = 'builder';
	}

	function editExam(e: ApiExamListItem) {
		builderReturn = view;
		const subj = subjects.find((s) => s.id === e.subjectId) ?? null;
		activeSubject = subj;
		editingExamId = e.id;
		builderStart = 0;
		view = 'builder';
	}

	function returnFromBuilder() {
		view = builderReturn || 'home';
		editingExamId = null;
		void refresh();
	}

	let returnLabel = $derived(
		builderReturn === 'home' ? 'На Главную' :
		builderReturn === 'subjects' ? 'К предметам' :
		builderReturn === 'tickets' ? 'К билетам' :
		builderReturn === 'subject' ? `К предмету ${activeSubject?.code || ''}`.trim() :
		'Назад'
	);

	let crumbs = $derived<Crumb[]>(
		view === 'home' ? [{ label: 'Рабочее пространство' }, { label: 'Главная' }]
		: view === 'subjects' ? [{ label: 'Рабочее пространство' }, { label: 'Предметы' }]
		: view === 'tickets' ? [{ label: 'Рабочее пространство' }, { label: 'Билеты' }]
		: view === 'subject' ? [
			{ label: 'Рабочее пространство' },
			{ label: 'Предметы', onClick: () => (view = 'subjects') },
			{ label: activeSubject?.name || 'Предмет' }
		]
		: [
			{ label: 'Рабочее пространство' },
			{ label: 'Предметы', onClick: () => (view = 'subjects') },
			{ label: activeSubject?.name || 'Предмет', onClick: () => (view = 'subject') },
			{ label: editingExamId ? 'Редактирование экзамена' : 'Новый экзамен' }
		]
	);

	let sidebarActive = $derived(
		view === 'home' ? 'home' :
		view === 'subjects' ? 'subjects' :
		view === 'tickets' ? 'tickets' :
		view === 'subject' ? 'subjects' :
		view === 'builder' ? (builderReturn === 'tickets' ? 'tickets' : builderReturn === 'home' ? 'home' : 'subjects') :
		'home'
	);

	let totalExams = $derived(exams.length);
	let primaryHandler = $derived((view === 'builder' || view === 'home') ? null : () => createExam(activeSubject));
	let primaryLabel = $derived(view === 'subject' ? 'Новый экзамен' : 'Создать экзамен');
</script>

<svelte:head><title>Ticketer — Главная</title></svelte:head>

<div class="app">
	<Sidebar
		active={sidebarActive}
		onNavigate={navigate}
		counts={{ subjects: subjects.length, tickets: totalExams }}
	/>
	<main class="main">
		<Topbar
			{crumbs}
			onPrimary={primaryHandler}
			{primaryLabel}
		/>

		{#if loading && subjects.length === 0}
			<div class="empty"><h3>Загружаем…</h3></div>
		{:else if loadError && subjects.length === 0}
			<div class="empty">
				<h3>Не удалось подключиться к серверу</h3>
				<p>{loadError}</p>
				<button class="btn btn-primary" onclick={refresh}>Повторить</button>
			</div>
		{:else if view === 'home'}
			<HomeView
				{subjects}
				upcoming={upcomingSessions}
				onOpenSubject={openSubject}
				onCreate={() => createExam(null)}
				onAddSubject={() => (showAddSubject = true)}
			/>
		{:else if view === 'subjects'}
			<SubjectsListView
				{subjects}
				onOpenSubject={openSubject}
				onAddSubject={() => (showAddSubject = true)}
				onMockCreated={refresh}
			/>
		{:else if view === 'tickets'}
			<TicketsView
				{subjects}
				{exams}
				onOpenSubject={openSubject}
				onCreateExam={createExam}
				onExamsChanged={refresh}
				onEditExam={editExam}
			/>
		{:else if view === 'subject' && activeSubject}
			<SubjectView
				subject={activeSubject}
				onBack={() => (view = 'subjects')}
				onCreateExam={createExam}
				onEditExam={editExam}
			/>
		{:else if view === 'builder'}
			<BuilderView
				{subjects}
				subject={activeSubject}
				startStep={builderStart}
				{editingExamId}
				onBack={returnFromBuilder}
				onPublished={refresh}
				{returnLabel}
				onAddSubject={() => (showAddSubject = true)}
			/>
		{/if}
	</main>
</div>

<AddSubjectModal
	open={showAddSubject}
	onClose={() => (showAddSubject = false)}
	onAdded={handleSubjectAdded}
/>
