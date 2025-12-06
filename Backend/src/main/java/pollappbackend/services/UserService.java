package pollappbackend.services;

import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.concurrent.ExecutionException;

@Service
public class UserService {
     private final DataSource dataSource;

    public UserService(DataSource dataSource) {
        this.dataSource = dataSource;
    } // UserService

    public boolean usernameExists(String username) {
        String sql = "SELECT COUNT(*) FROM `User~ WHERE username = ?";

        try(Connection conn = dataSource.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, username);
            ResultSet rs = ps.executeQuery();
            
            if(rs.next()) {
                return rs.getInt(1) > 0;
            } // if

            return false;

        } catch(Exception e) {
            e.printStackTrace();
            return false;
        } // try catch

    } // usernameExists

    public void createUser(String username, String password, String displayName) {
        String sql = "INSERT INTO `User` (username, password, display_name) VALUES (?, ?, ?)";

        try(Connection conn = dataSource.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, username);
            ps.setString(2, password);
            ps.setString(3, displayName);
            ps.executeUpdate();

        } catch(Exception e) {
            e.printStackTrace();  
        } // try catch

    } // createUser

    public boolean validateLogin(String username, String password) {
        String sql = "SELECT password FROM `User` WHERE username = ?";

        try(Connection conn = dataSource.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            ResultSet rs = ps.executeQuery();

            if(rs.next()) {
                String storedPassword = rs.getString("password");
                // TODO: compared hashed password
                return storedPassword != null && storedPassword.equals(password);
            } // if

            return false;

        } catch(Exception e) {
            e.printStackTrace();
            return false;
        } // try catch

    } // validateLogin

} // UserService
