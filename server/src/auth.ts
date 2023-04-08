import * as fs from 'fs/promises';
import * as path from 'path';

export enum AccessLevel {
    guest = 0,
    user = 1,
    owner = 2
}

interface IBaseRec{
    _id?: string;
}

interface IUser extends IBaseRec{
    name: string;
    password: string;
    access: AccessLevel;
}

class FileBase<T extends {_id?: string}>{
    private fileName: string;
    //private list: Array<T>;
    constructor(fileName: string){
        this.fileName = fileName;
    }

    async init(){
        try{
            const stat = await fs.stat(this.fileName);
            if (!stat.isFile()){
                throw new Error('FileBase: file not found');
            }
        } catch (e){
            fs.writeFile(this.fileName, JSON.stringify([]), {encoding: 'utf8'});
        }
    }

    async read(): Promise<Array<T>>{
        try {
            const data = await fs.readFile(this.fileName, {encoding: 'utf8'});
            const list = JSON.parse(data);
            if (Array.isArray(list)){
                //this.list = list;
                return list;
            } else {
                throw new Error('FileBase: not array');
            }
        } catch(e){
            //this.list = [];
            return [];
        }
    }

    async write(data: T, id?:string){
        try{
            const lastData = await this.read();
            if (!id){
                const itemId = (Date.now() * 1e6 + Math.floor(Math.random() * 1e6)).toString(16);
                const newItem = {...data, _id: itemId};
                await fs.writeFile(this.fileName, JSON.stringify([...lastData, newItem]), {encoding: 'utf8'});
                return {
                    status: 'created',
                    data: newItem
                }
            } else {
                const itemIndex = lastData.findIndex(it=>{
                    return it._id == id;
                });
                if (itemIndex){
                    const updatedItem = {...data, _id: id};
                    const newList = [...lastData];
                    newList[itemIndex] = updatedItem;
                    await fs.writeFile(this.fileName, JSON.stringify(newList), {encoding: 'utf8'});
                    return {
                        status: 'updated',
                        data: updatedItem
                    }
                }
            }
        } catch(e){
            return {
                status: 'failed',
                data: null
            }
        }
    }
}

export class Auth{
    private base: FileBase<IUser>;
    sessions: Record<string, IUser> = {};
    constructor(){
        this.base = new FileBase(path.join(__dirname, 'config', 'users.json'));
    }

    async init(){
       return this.base.init(); 
    }

    async login(name: string, password: string){
        const dump = await this.base.read();
        const user = dump.find(it=> (it.name == name) && (it.password == password));
        if (user){
            const session = this.findSessionByUser(user);
            if (session){
                return session
            } else {
                const newSession = (Date.now() * 1e6 + Math.floor(Math.random() * 1e6)).toString(16);
                this.sessions[newSession] = user; //will problem with user update
                return newSession;
            }
        } else {
            return null;
        }
    }

    async logout(session:string){
        delete this.sessions[session];
        return true;
    }

    async register(name: string, password: string){
        this.base.write({
           name,
           password,
           access: AccessLevel.user 
        })
    }

    findSessionByUser(user:IUser){
        return Object.keys(this.sessions).find(session=>{
            const it = this.sessions[session];
            if (it._id == user._id){
                return true
            }
            return false;
        })
    }

    checkSession(session:string){
        return this.sessions[session];
    }
}