import { Session, Media } from "./Contracts";

export class Requestor {

    public JoinSession = (sessionName: string, callback: (session: Session) => void) => {

    }

    public Search = (query: string, page: number, callback: (searchResults: Media[]) => void) => {
    
    }

    public AddMediaToSession = (media: Media, callback: (updatedQueue: Media[]) => void) => {
         
    }

    public DeleteMediaFromSession = (mediaId: number, callback: (updatedQueue: Media[]) => void) => {
         
    }

}