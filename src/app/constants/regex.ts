export class Regex {
    public static EMAIL = new RegExp(`^[\\w\-\\.]+@([\\w\-]+\\.)+[\\w\-]{2,4}$`);
    public static PASSWORD = new RegExp(`^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$.])[a-zA-Z0-9!@#$.]{8,}$`);
}