'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OccurrenceDetail } from '@/types/occurrence'
import { normalizeString } from '@/lib/utils' // Importar de lib/utils

interface OccurrenceTypeBarChartProps {
  occurrences: OccurrenceDetail[];
