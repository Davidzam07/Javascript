// Utilidades
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

// Datos en memoria
let taskState = {
	items: [],
	filter: 'all',
	sort: 'created_desc'
};

// Constructor de tareas
function Task(title) {
	this.id = crypto.randomUUID();
	this.title = title;
	this.done = false;
	this.createdAt = Date.now();
}

// Capa de almacenamiento
const Storage = {
	key: 'tasks_v1',
	load() {
		try {
			const raw = localStorage.getItem(this.key);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			console.error('Error al cargar tareas:', error);
			return [];
		}
	},
	save(items) {
		try {
			localStorage.setItem(this.key, JSON.stringify(items));
			return true;
		} catch (error) {
			console.error('Error al guardar tareas:', error);
			return false;
		}
	}
};

// Funciones de orden superior para ordenar/filtrar
const byCreatedDesc = (a, b) => b.createdAt - a.createdAt;
const byCreatedAsc = (a, b) => a.createdAt - b.createdAt;
const byAlphaAsc = (a, b) => a.title.localeCompare(b.title);
const byAlphaDesc = (a, b) => b.title.localeCompare(a.title);

const filters = {
	all: () => true,
	open: (t) => !t.done,
	done: (t) => t.done
};

const sorts = {
	created_desc: byCreatedDesc,
	created_asc: byCreatedAsc,
	alpha_asc: byAlphaAsc,
	alpha_desc: byAlphaDesc
};

// Render
function render() {
	const list = $('#task-list');
	list.innerHTML = '';

	const filtered = taskState.items.filter(filters[taskState.filter]);
	const sorted = filtered.slice().sort(sorts[taskState.sort]);

	sorted.forEach(task => {
		const li = document.createElement('li');
		li.className = 'task-item' + (task.done ? ' done' : '');
		li.dataset.id = task.id;

		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = task.done;
		checkbox.addEventListener('change', () => toggleTask(task.id));

		const title = document.createElement('p');
		title.className = 'task-title';
		title.textContent = task.title;

		const actions = document.createElement('div');
		actions.className = 'task-actions';

		const delBtn = document.createElement('button');
		delBtn.textContent = 'Eliminar';
		delBtn.addEventListener('click', () => deleteTask(task.id));

		actions.appendChild(delBtn);

		li.appendChild(checkbox);
		li.appendChild(title);
		li.appendChild(actions);
		list.appendChild(li);
	});

	updateStats();
	updateFilterButtons();
}

function updateStats() {
	const total = taskState.items.length;
	const done = taskState.items.filter(t => t.done).length;
	const open = total - done;
	$('#stats').textContent = `Total: ${total} | Pendientes: ${open} | Completadas: ${done}`;
}

function updateFilterButtons() {
	$$('.filter').forEach(btn => {
		btn.classList.toggle('is-active', btn.dataset.filter === taskState.filter);
	});
}

// Acciones
function addTask(title) {
	const trimmed = title.trim();
	if (!trimmed) return;
	const newTask = new Task(trimmed);
	taskState.items.unshift(newTask);
	Storage.save(taskState.items);
	render();
}

function toggleTask(id) {
	taskState.items = taskState.items.map(t => t.id === id ? { ...t, done: !t.done } : t);
	Storage.save(taskState.items);
	render();
}

function deleteTask(id) {
	taskState.items = taskState.items.filter(t => t.id !== id);
	Storage.save(taskState.items);
	render();
}

function setFilter(filter) {
	taskState.filter = filter;
	render();
}

function setSort(sort) {
	taskState.sort = sort;
	render();
}

// Eventos DOM (sin DOMContentLoaded)
// Al estar el script al final del body, el DOM ya está disponible
const form = $('#task-form');
const input = $('#task-title');
const listEl = $('#task-list');
const sortSelect = $('#sort-select');

form.addEventListener('submit', (ev) => {
	ev.preventDefault();
	addTask(input.value);
	input.value = '';
	input.focus();
});

$$('.filter').forEach(btn => {
	btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

sortSelect.addEventListener('change', () => setSort(sortSelect.value));

// Inicializar estado desde storage y renderizar
(function init() {
	taskState.items = Storage.load();
	render();
})();

// Async + manejo de errores
async function fetchQuote() {
	const endpoint = 'https://api.quotable.io/random';
	try {
		$('#load-quote').disabled = true;
		$('#quote-text').textContent = 'Cargando...';
		$('#quote-author').textContent = '';

		const res = await fetch(endpoint, { headers: { 'accept': 'application/json' } });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		$('#quote-text').textContent = `“${data.content}”`;
		$('#quote-author').textContent = data.author ? `— ${data.author}` : '';
	} catch (error) {
		console.error(error);
		$('#quote-text').textContent = 'No se pudo cargar la frase. Intenta de nuevo.';
	} finally {
		$('#load-quote').disabled = false;
	}
}

$('#load-quote').addEventListener('click', fetchQuote);