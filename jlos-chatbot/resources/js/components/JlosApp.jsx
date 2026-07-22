import React, { useState } from 'react';
import InstitutionSelector from './InstitutionSelector';
import ChatWindow from './ChatWindow';

export default function JlosApp() {
    const [institution, setInstitution] = useState(null);

    if (!institution) {
        return <InstitutionSelector onSelect={setInstitution} />;
    }

    return <ChatWindow institution={institution} onBack={() => setInstitution(null)} />;
}
