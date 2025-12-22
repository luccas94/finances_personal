'use client'
import CameraInput from '../../../components/CameraInput'
import DespesaForm from '../../../components/DespesaForm'

export default function NovaDespesaPage() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Nova despesa</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <CameraInput />
        </div>
        <div className="md:col-span-3">
          <DespesaForm />
        </div>
      </div>
    </section>
  )
}
