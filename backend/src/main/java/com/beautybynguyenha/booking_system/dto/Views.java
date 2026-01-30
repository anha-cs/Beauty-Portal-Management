package com.beautybynguyenha.booking_system.dto;

public class Views {
    // This tag is for fields everyone (including customers) can see
    public interface Public {}

    // This tag is for fields only Admins can see.
    // It extends Public so that Admins see Public fields + Admin fields.
    public interface Admin extends Public {}
}