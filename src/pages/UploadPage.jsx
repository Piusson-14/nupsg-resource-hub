import { UploadPanel } from '../components/UploadPanel';
import { uploadResource } from '../lib/resourceService';
export function UploadPage(){return <main className='page-shell upload-page'><div className='page-intro'><p className='eyebrow'>Contribute to the library</p><h1>Share knowledge. <span>Lift someone up.</span></h1><p>Every resource makes the NUPS-G community a little stronger.</p></div><section className='upload-panel'><UploadPanel onUpload={uploadResource}/></section></main>}
