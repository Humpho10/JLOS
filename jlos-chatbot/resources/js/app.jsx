import React from 'react';
import { createRoot } from 'react-dom/client';
import JlosApp from './components/JlosApp';

const root = document.getElementById('app');
if (root) {
    createRoot(root).render(<JlosApp />);
}