package pollappbackend.tools;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import org.mindrot.jbcrypt.BCrypt;

public class DataPopulation {
    private static final String DB_URL = "jdbc:mysql://localhost:33306/db_term_project";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "mysqlpass";

    public static void main(String[] args) {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
            conn.setAutoCommit(false);

            // Insert 3 users (hashed passwords for "pass123")
            String hashedPass = BCrypt.hashpw("pass123", BCrypt.gensalt());
            insertUser(conn, "testuser", hashedPass, "Test User");
            insertUser(conn, "kayla", hashedPass, "Kayla");
            insertUser(conn, "carnagist", hashedPass, "Carnagist");

            // Meaningful polls (creator_id = 1 for testuser)
            int poll1 = insertPoll(conn, "Favorite CS Professor?", 1);
            insertOption(conn, poll1, "Hollingsworth");
            insertOption(conn, poll1, "Lamarca");
            insertOption(conn, poll1, "Sami Menik");

            int poll2 = insertPoll(conn, "Best Study Spot on Campus?", 2);
            insertOption(conn, poll2, "Main Library");
            insertOption(conn, poll2, "MLC");
            insertOption(conn, poll2, "Tate");
            insertOption(conn, poll2, "Oglethorpe");

            int poll3 = insertPoll(conn, "Best Dining Hall at UGA?", 3);
            insertOption(conn, poll3, "Bolton");
            insertOption(conn, poll3, "Oglethorpe");
            insertOption(conn, poll3, "Village Summit");
            insertOption(conn, poll3, "Orbit");

            int poll4 = insertPoll(conn, "Which bus route is worst?", 1);
            insertOption(conn, poll4, "East-West");
            insertOption(conn, poll4, "Night Campus");
            insertOption(conn, poll4, "Riverbend");
            insertOption(conn, poll4, "Orbit");

            int poll5 = insertPoll(conn, "Hardest CS course?", 1);
            insertOption(conn, poll5, "CSCI 1302");
            insertOption(conn, poll5, "CSCI 1730");
            insertOption(conn, poll5, "CSCI 2150");
            insertOption(conn, poll5, "CSCI 2720");
            insertOption(conn, poll5, "CSCI 4210");

            // 250 dummy polls (creator_id = 1, 4 options each: A B C D)
            for (int i = 1; i <= 250; i++) {
                int dummyPoll = insertPoll(conn, "Dummy Poll " + i, 1);
                insertOption(conn, dummyPoll, "A");
                insertOption(conn, dummyPoll, "B");
                insertOption(conn, dummyPoll, "C");
                insertOption(conn, dummyPoll, "D");
            }

            conn.commit();
            System.out.println("Data populated: 3 users, 255 polls, 1020 options.");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private static void insertUser(Connection conn, String username, String hashedPass, String displayName) throws SQLException {
        String sql = "INSERT INTO `User` (username, password, display_name) VALUES (?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, hashedPass);
            ps.setString(3, displayName);
            ps.executeUpdate();
        }
    }

    private static int insertPoll(Connection conn, String title, int creatorId) throws SQLException {
        String sql = "INSERT INTO Poll (title, created_at, updated_at, creator_id) VALUES (?, NOW(), NOW(), ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, title);
            ps.setInt(2, creatorId);
            ps.executeUpdate();
            try (var rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return -1;
    }

    private static void insertOption(Connection conn, int pollId, String text) throws SQLException {
        String sql = "INSERT INTO PollOption (poll_id, text, votes) VALUES (?, ?, 0)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, pollId);
            ps.setString(2, text);
            ps.executeUpdate();
        }
    }
}