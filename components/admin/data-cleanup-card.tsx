'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Archive } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function DataCleanupCard() {
  const handleCleanup = () => {
    // Simula uma operação de limpeza de dados
    console.log('Iniciando limpeza de dados antigos...')
    toast({
      title: 'Limpeza de Dados',
      description: 'A limpeza de dados antigos foi iniciada. Isso pode levar alguns minutos.',
    })
    // Em uma aplicação real, você faria uma chamada API aqui
    setTimeout(() => {
      toast({
        title: 'Limpeza Concluída',
        description: 'Dados antigos foram arquivados/removidos com sucesso.',
      })
    }, 2000)
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">Limpeza de Dados Antigos</CardTitle>
        <CardDescription className="text-red-700">
          Esta ação irá arquivar ou remover dados que excedem um período de retenção definido. Esta operação é irreversível.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Recomendado executar periodicamente para manter a performance.</span>
        </div>
        <Button onClick={handleCleanup} variant="destructive">
          <Archive className="mr-2 h-4 w-4" /> Limpar Dados Antigos
        </Button>
      </CardContent>
    </Card>
  )
}
