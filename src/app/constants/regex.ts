export class Regex {
    // Literal Syntax
    public static EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // `^[\\w\-\\.]+@([\\w\-]+\\.)+[\\w\-]{2,4}$`
    // Constructor Syntax
    public static PASSWORD = new RegExp(`^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$.])[a-zA-Z0-9!@#$.]{8,}$`);
}