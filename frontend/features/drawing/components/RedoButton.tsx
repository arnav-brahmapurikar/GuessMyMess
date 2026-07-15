import { Button } from '@/components/ui/button'
import { Redo2 } from 'lucide-react'
import React, { RefObject, useEffect } from 'react'
import { Stroke } from '../types'

export default function RedoButton({disabled , redo} : {
    disabled : RefObject<Stroke[]> , redo : ()=>void
}) {

    useEffect(()=>{

    }, [disabled.current.length])

  return (
    <Button
    
                onClick={redo}
    
                disabled={disabled.current.length === 0}
    
                size="icon"
    
                variant="secondary"
    
                className="
                absolute
                top-4
                right-4
    
                rounded-full
    
                bg-white/80
                backdrop-blur-md
    
                shadow-lg
    
                hover:scale-110
                transition
                "
    
            >
    
                <Redo2
                    size={18}
                />
    
            </Button>
  )
}
