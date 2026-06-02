'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

const SIZE_CHART = [
  { size: 'XS', chest: '86–91', waist: '71–76', length: '68' },
  { size: 'S',  chest: '91–96', waist: '76–81', length: '70' },
  { size: 'M',  chest: '96–101', waist: '81–86', length: '72' },
  { size: 'L',  chest: '101–107', waist: '86–91', length: '74' },
  { size: 'XL', chest: '107–112', waist: '91–97', length: '76' },
  { size: 'XXL', chest: '112–118', waist: '97–102', length: '78' },
]

interface SizeGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SizeGuideDialog({ open, onOpenChange }: SizeGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Size Guide</DialogTitle>
          <DialogDescription>
            All measurements in centimetres. Measure over a light shirt for best fit.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Size', 'Chest', 'Waist', 'Length'].map((h) => (
                  <th
                    key={h}
                    className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row) => (
                <tr key={row.size} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 pr-4 font-semibold text-foreground">{row.size}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{row.chest}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{row.waist}</td>
                  <td className="py-2.5 text-muted-foreground">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
