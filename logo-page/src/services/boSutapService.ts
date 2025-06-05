import { BoSuTap } from "@/components/types/product.type";

const API_URL ='http://localhost:8080/api/bosuutap';
export const boSuuTapService ={
    async getBoSutap():Promise<BoSuTap [] >{
        try{
            const res=await fetch(`${API_URL}/ReadAll` ,{cache: 'no-store'});
            if(!res.ok){
                throw new Error ('Khong tìm thấy bộ sưu tập ');
            }
            return await res.json();
        }catch(error){
            console.log("Lối" + error);
            throw error;
        }
    }
}