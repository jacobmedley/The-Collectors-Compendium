#!/usr/bin/env node
// One-time script: extract icon arrays from lucide@0.383.0 → icons.json
// Run: node generate-icons.mjs
// Commit icons.json; build.mjs reads it without needing lucide at runtime.

import { writeFileSync } from 'node:fs';
import {
  Search, Filter, ArrowUp, ArrowDown, X, Edit3, ExternalLink,
  TrendingUp, TrendingDown, Minus, Gift, Info, BarChart3,
  ChevronDown, ChevronUp, Award, Zap, CheckCircle2, Wallet,
  CalendarClock, Percent,
} from 'lucide';

const icons = {
  Search, Filter, ArrowUp, ArrowDown, X, Edit3, ExternalLink,
  TrendingUp, TrendingDown, Minus, Gift, Info, BarChart3,
  ChevronDown, ChevronUp, Award, Zap, CheckCircle2, Wallet,
  CalendarClock, Percent,
};

writeFileSync('icons.json', JSON.stringify(icons) + '\n');
console.log(`✓ icons.json written (${Object.keys(icons).length} icons)`);
