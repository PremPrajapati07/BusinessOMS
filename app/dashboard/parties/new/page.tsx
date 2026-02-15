import PartyForm from "../components/PartyForm"

export default function NewPartyPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Add New Party</h1>
            <PartyForm />
        </div>
    )
}
