import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { act } from 'react-dom/test-utils';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('checks answers, shows progress, and switches to a list without duplicating questions', () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  act(() => ReactDOM.render(<App />, div));
  const button = text => [...div.querySelectorAll('button')].find(b => b.textContent === text);
  expect(div.querySelector('[aria-current="step"]')).not.toBeNull();
  expect(div.querySelector('.stat:last-child .stat-value').textContent).toContain('—');
  act(() => div.querySelector('input[type="checkbox"]').click());
  expect(div.querySelector('.is-selected')).not.toBeNull();
  act(() => button('Check answer').click());
  expect(div.querySelector('[role="status"]')).not.toBeNull();
  expect([...div.querySelectorAll('input[type="checkbox"]')].every(input => input.disabled)).toBe(true);
  expect(div.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('1');
  act(() => button('All questions').click());
  expect(div.querySelectorAll('.question-card')).toHaveLength(2);
  act(() => button('Practice').click());
  expect(div.querySelectorAll('.question-card')).toHaveLength(1);
  act(() => button('Filters').click());
  act(() => button('Normal · 2').click());
  expect(div.querySelector('.empty-state').textContent).toContain('No questions match your filters');
  expect(div.querySelectorAll('.question-number')).toHaveLength(0);
  act(() => button('Show all questions').click());
  expect(div.querySelectorAll('.question-card')).toHaveLength(1);
  act(() => ReactDOM.unmountComponentAtNode(div));
  div.remove();
});
