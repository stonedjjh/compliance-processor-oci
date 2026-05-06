import bcrypt

def hash_password(password: str) -> str:
    """Genera un hash usando bcrypt de forma directa."""
    pwd_bytes = password.encode("utf-8")
    
    # Truncado manual preventivo (estándar de bcrypt)
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
        
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica la contraseña usando bcrypt.checkpw directamente."""
    try:
        # 1. Encoding
        pwd_bytes = plain_password.encode("utf-8")
        
        # 2. Truncado igual al del hash
        if len(pwd_bytes) > 72:
            pwd_bytes = pwd_bytes[:72]
            
        # 3. El hash de la DB también a bytes
        hash_bytes = hashed_password.encode("utf-8")
        
        # 4. Comparación directa (sin Passlib)
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception as e:
        print(f"Error crítico en validación: {str(e)}")
        return False